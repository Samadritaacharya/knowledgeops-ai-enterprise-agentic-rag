"""Optional RAGAS experiment hook.

The mandatory CI does not depend on external LLM judges or accounts. This file exists to make
LLM-based evaluation an explicit, reproducible extension once a local Ollama or another provider
is configured. Keep deterministic goldset metrics as the release gate; use RAGAS as an additional
quality signal, not a substitute for regression tests.
"""

def availability():
    try:
        import ragas  # noqa:F401
        return {'ragas_installed':True}
    except Exception:
        return {'ragas_installed':False,'install':'pip install -r requirements-optional.txt'}

if __name__=='__main__': print(availability())
