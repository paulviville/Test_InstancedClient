const socket = new WebSocket(`ws://localhost:8080`);

socket.onopen = ( ) => { console.log("socket open")};
socket.onerror = ( ) => { console.log("socket error")};