import asyncio, json, os, sys, logging
from typing import Dict, Any, List
from contextlib import AsyncExitStack
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from groq import Groq

root = logging.getLogger()
root.handlers.clear()
root.setLevel(logging.CRITICAL)
for name in logging.Logger.manager.loggerDict:
    lg = logging.getLogger(name)
    lg.handlers.clear()
    lg.setLevel(logging.CRITICAL)
logging.disable(logging.CRITICAL)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Check environment or .env file for GROQ_API_KEY
if not os.environ.get("GROQ_API_KEY") and os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("GROQ_API_KEY="):
                    os.environ["GROQ_API_KEY"] = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"
MAX_STEPS = 10


def create_chat_completion(**kwargs):
    global MODEL
    models_to_try = [kwargs.get("model", MODEL), "openai/gpt-oss-120b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"]
    # Remove duplicates preserving order
    tried = []
    for m in models_to_try:
        if m and m not in tried:
            tried.append(m)

    last_err = None
    for m in tried:
        try:
            kwargs["model"] = m
            res = client.chat.completions.create(**kwargs)
            MODEL = m
            return res
        except Exception as e:
            last_err = e
            if "model_not_found" in str(e) or "does not exist" in str(e):
                continue
            raise
    raise last_err


def build_system_prompt(tools: List[Any]) -> str:
    """Dynamically builds the system prompt with MCP tools and intent-based routing guide."""
    tool_lines = []
    for idx, t in enumerate(tools, 1):
        if hasattr(t, "name"):
            props = getattr(t, "inputSchema", {}) or {}
            if isinstance(props, dict):
                prop_dict = props.get("properties", {})
                params = [f"{p}: {prop_dict[p].get('type', 'any')}" for p in prop_dict]
                sig = f"{t.name}({', '.join(params)})"
            else:
                sig = t.name
            desc = f" -> {t.description}" if getattr(t, "description", None) else ""
            tool_lines.append(f"{idx}. {sig}{desc}")
        else:
            tool_lines.append(f"{idx}. {t}")
    tool_list_str = "\n".join(tool_lines)

    return f"""You are WeekendWiz, an executive AI Travel Concierge and Trip Planner powered by MCP. You have access to these live MCP tools:

{tool_list_str}

Tool routing guide:
- Plan trip / itinerary / weekend / offsite -> generate_multiday_itinerary (or generate_itinerary)
- Budget / cost estimation / expenses -> estimate_budget
- Transit, airports, plugs, tipping, emergency numbers -> travel_essentials
- Packing advice, checklist, weather risk -> weather_packing_checklist (or weather_packing_advisor)
- Attractions, museums, landmarks, sightseeing -> find_attractions (or find_activities)
- Weather forecast, rain, temperature -> get_weather_forecast (or get_weather)
- Calendar export -> export_calendar_ics
- Destination coordinates / info -> resolve_destination (or city_to_coords)

RULES:
- Call tools ONE AT A TIME as needed.
- Gather all necessary real-time facts from MCP tools before formulating your final answer. Do NOT hallucinate weather, attractions, or budgets.
- Call ONLY the tools the user's request actually needs.
- Each step output EXACTLY one JSON object and nothing else:
  To call a tool: {{"action": "tool_name", "args": {{"param": "value"}}}}
  When done: {{"action": "final", "answer": "your comprehensive structured response"}}
- Do NOT repeat the same tool call.
- Provide professional, structured markdown responses with time slots, tips, and financial breakdowns."""


def print_tool_summary(tools_used: List[Dict[str, Any]]):
    """Prints formatted summary of tools invoked during the user turn."""
    if not tools_used:
        print("\n--- Tools used: 0 (answered directly) ---")
        return

    print(f"\n--- Tools used: {len(tools_used)} ---")
    for idx, call in enumerate(tools_used, 1):
        name = call["name"]
        args = call.get("args", {})
        failed = call.get("failed", False)

        if not args:
            args_str = "()"
        else:
            parts = []
            for k, v in args.items():
                if isinstance(v, str):
                    parts.append(f'{k}="{v}"')
                else:
                    parts.append(f'{k}={v}')
            args_str = f"({', '.join(parts)})"

        col_width = max(16, len(name) + 2)
        failed_tag = " (failed)" if failed else ""
        print(f"{idx}. {name:<{col_width}}{args_str}{failed_tag}")


def extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    depth = 0
    start = None
    candidates = []
    for i, ch in enumerate(text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    obj = json.loads(text[start:i+1])
                    if isinstance(obj, dict) and "action" in obj:
                        candidates.append(obj)
                except Exception:
                    pass
    if candidates:
        tool_actions = [c for c in candidates if c.get("action") != "final"]
        if tool_actions:
            return tool_actions[0]
        return candidates[0]
    raise ValueError("No valid JSON found")


def llm_json(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    resp = create_chat_completion(
        model=MODEL,
        messages=messages,
        temperature=0.2
    )
    msg = resp.choices[0].message
    raw_texts = []
    if msg.content:
        raw_texts.append(msg.content)
    reasoning = getattr(msg, "reasoning", "")
    if reasoning:
        raw_texts.append(reasoning)

    # First try to find any tool action from content or reasoning
    for text in raw_texts:
        try:
            cand = extract_json(text)
            if cand.get("action") != "final":
                return cand
        except Exception:
            pass

    # If no tool action found, try any valid json (including final)
    for text in raw_texts:
        try:
            return extract_json(text)
        except Exception:
            pass

    # Fallback extraction pass
    fallback_text = "\n".join(raw_texts).strip()
    try:
        fix = create_chat_completion(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Extract ONLY the JSON object from the text below. Return nothing else."},
                {"role": "user", "content": fallback_text}
            ],
            temperature=0
        )
        fix_msg = fix.choices[0].message
        fix_txt = fix_msg.content or getattr(fix_msg, "reasoning", "") or ""
        return extract_json(fix_txt)
    except Exception:
        for text in raw_texts:
            depth = 0
            start = None
            for i, ch in enumerate(text):
                if ch == '{':
                    if depth == 0:
                        start = i
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0 and start is not None:
                        try:
                            cand = json.loads(text[start:i+1])
                            if isinstance(cand, dict) and "answer" in cand:
                                return {"action": "final", "answer": cand["answer"]}
                        except Exception:
                            pass
        if fallback_text:
            return {"action": "final", "answer": fallback_text}
        raise ValueError("No valid JSON or text response found")


def reflect(answer: str) -> str:
    resp = create_chat_completion(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a quick quality checker for a weekend planner. Check if the answer has any clearly wrong facts (like wrong temperature, broken links). Minor style issues are fine. Reply with the full corrected answer if there are real errors, or reply EXACTLY the word 'ok' if it is acceptable."},
            {"role": "user", "content": answer}
        ],
        temperature=0,
        max_tokens=500
    )
    msg = resp.choices[0].message
    result = (msg.content or getattr(msg, "reasoning", "") or "").strip()
    if not result or result.lower() == "ok" or "ok" in result.lower():
        return answer
    return result


async def main():
    server_path = sys.argv[1] if len(sys.argv) > 1 else ("server_fun.py" if os.path.exists("server_fun.py") else "s.py")
    exit_stack = AsyncExitStack()
    stdio = await exit_stack.enter_async_context(
        stdio_client(StdioServerParameters(command=sys.executable, args=[server_path]))
    )
    r_in, w_out = stdio
    session = await exit_stack.enter_async_context(ClientSession(r_in, w_out))
    await session.initialize()

    tools = (await session.list_tools()).tools
    tool_index = {t.name: t for t in tools}
    system_prompt = build_system_prompt(tools)

    try:
        while True:
            try:
                user = input("\nYou: ").strip()
            except EOFError:
                break
            if not user or user.lower() in {"exit", "quit"}:
                break

            # Reset tools used list for each new user turn
            tools_used: List[Dict[str, Any]] = []

            # Start fresh for each question - only system + user
            history = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user}]

            for step in range(MAX_STEPS):
                decision = llm_json(history)
                action = decision.get("action", "unknown")

                if action == "final":
                    answer = decision.get("answer", "No answer generated.")
                    answer = reflect(answer)
                    print("\nAgent:", answer)
                    print_tool_summary(tools_used)
                    history.append({"role": "assistant", "content": answer})
                    break

                tname = decision.get("action")
                args = decision.get("args", {})
                if tname not in tool_index:
                    history.append({
                        "role": "assistant",
                        "content": f"Tool '{tname}' not found. Available: {list(tool_index.keys())}"
                    })
                    continue

                # Record the assistant's tool call decision in history
                history.append({"role": "assistant", "content": json.dumps(decision)})

                print(f"> Calling tool: {tname}...")
                failed = False
                payload = ""
                try:
                    result = await session.call_tool(tname, args)
                    if getattr(result, "isError", False):
                        failed = True
                    payload = result.content[0].text if result.content else "No content"
                    try:
                        parsed = json.loads(payload)
                        if isinstance(parsed, dict) and "error" in parsed:
                            failed = True
                    except Exception:
                        pass
                except Exception as e:
                    failed = True
                    payload = f"Error executing tool: {e}"

                tools_used.append({
                    "name": tname,
                    "args": args,
                    "failed": failed
                })

                history.append({
                    "role": "user",
                    "content": f"[Observation from {tname}]: {payload}\n\nNow decide your next step. Continue calling any remaining tools needed to fulfill the request before outputting final."
                })
            else:
                print("\nAgent: Reached maximum steps without concluding.")
                print_tool_summary(tools_used)
    finally:
        await exit_stack.aclose()


if __name__ == "__main__":
    asyncio.run(main())
