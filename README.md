# Containarised version of the frontend

1. Build the docker image:
```
docker build -t testing-toolkit-server .
```
2. Run the container:
```
docker run -d -p 7000:7000 --name server-container testing-toolkit-server
```
3. The testing site is accessible on:
```
http://localhost:7000
```