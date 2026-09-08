import requests
import sys

def main():
    try:
        print("Checking S.P.A.R.K. Infrastructure Health...")
        response = requests.get("http://localhost:8000/api/v1/health")
        data = response.json()
        
        print("\n--- Health Check Results ---\n")
        print(f"Overall Status: {data.get('status')}\n")
        
        services = data.get('services', {})
        for service, info in services.items():
            status = info.get('status')
            latency = info.get('latency_ms')
            latency_str = f"{latency}ms" if latency is not None else "N/A"
            print(f"- {service.upper()}: {status} (Latency: {latency_str})")
        
        if response.status_code == 200:
            print("\nAll systems GO. S.P.A.R.K. backend is fully connected to offline infrastructure.")
            sys.exit(0)
        else:
            print("\nSome systems are failing. Please check the logs.")
            sys.exit(1)
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to FastAPI at http://localhost:8000")
        print("Make sure the backend server is running using: uvicorn app.main:app --reload")
        sys.exit(1)

if __name__ == "__main__":
    main()
