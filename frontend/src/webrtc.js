import socket from "./socket";

let peerConnection;
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export async function startCall(receiverId, localStream) {
  peerConnection = new RTCPeerConnection(iceServers);

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("sendIceCandidate", { receiverId, candidate: event.candidate });
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.streams[0];
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("sendOffer", { receiverId, offer });
}

socket.on("receiveOffer", async ({ senderId, offer }) => {
  peerConnection = new RTCPeerConnection(iceServers);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("sendIceCandidate", { receiverId: senderId, candidate: event.candidate });
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.streams[0];
  };

  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = localStream;

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("sendAnswer", { userId: senderId, answer });
});

// socket.on("receiveAnswer", async ({senderId, answer }) => {
//   await peerConnection.setRemoteDescription(answer);
// });

// socket.on("receiveIceCandidate", async ({ senderId, candidate }) => {
//   await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
// });
