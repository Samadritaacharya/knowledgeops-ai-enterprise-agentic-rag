.PHONY: test eval api
test:
	python -m unittest discover -s tests -p 'test_*.py' -v
eval:
	python scripts/evaluate.py
api:
	uvicorn api:app --reload
