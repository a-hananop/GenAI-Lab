import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyD1st0kJBx7ipOGWz5jRA6dHfkkwvPFLp4"))
print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)

