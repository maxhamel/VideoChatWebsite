const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
const userName = "Max-" + Math.floor(Math.random() * 100000);
const password = "x";
const socket = io.connect("https://localhost:3000/", {
  auth: {
    userName,
    password,
  },
});

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const call = async (e) => {
  await fetchUserMedia();

  await createPeerConnection();

  try {
    console.log("Creating offer...");
    const offer = await peerConnection.createOffer();
    console.log(offer);
    peerConnection.setLocalDescription(offer);
    didIOffer = true;
    socket.emit("newOffer", offer);
  } catch (err) {
    console.log(err);
  }
};

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoEl.srcObject = stream;
      localStream = stream;
      resolve();
    } catch (err) {
      console.log(err);
      reject();
    }
  });
};

const createPeerConnection = (offerObj) => {
  return new Promise(async (resolve, reject) => {
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener("signalingstatechange", (event) => {
      console.log(event);
      console.log(peerConnection.signalingState);
    });

    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("........Ice candidate found!......");
      console.log(e);
      if (e.candidate) {
        socket.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: e.candidate,
          iceUserName: userName,
          didIOffer,
        });
      }
    });

    peerConnection.addEventListener("track", (e) => {
      console.log("Got a track from the other peer");
      console.log(e);
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
      });
    });

    if (offerObj) {
      await peerConnection.setRemoteDescription(offerObj.offer);
    }
    resolve();
  });
};

const addNewIceCandidate = (iceCandidate) => {
  peerConnection.addIceCandidate(iceCandidate);
  console.log("======Added Ice Candidate======");
};

socket.on("availableOffers", (offers) => {
  console.log(offers);
  createOfferEls(offers);
});

socket.on("newOfferAwaiting", (offers) => {
  createOfferEls(offers);
});

socket.on("answerResponse", (offerObj) => {
  console.log(offerObj);
  addAnswer(offerObj);
});

socket.on("receivedIceCandidateFromServer", (iceCandidate) => {
  addNewIceCandidate(iceCandidate);
  console.log(iceCandidate);
});

function createOfferEls(offers) {
  const answerEl = document.querySelector("#answer");
  offers.forEach((o) => {
    console.log(o);
    const newOfferEl = document.createElement("div");
    newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offererUserName}</button>`;
    newOfferEl.addEventListener("click", () => answerOffer(o));
    answerEl.appendChild(newOfferEl);
  });
}
const answerOffer = async (offerObj) => {
  await fetchUserMedia();
  await createPeerConnection(offerObj);
  const answer = await peerConnection.createAnswer({});
  await peerConnection.setLocalDescription(answer);
  console.log(offerObj);
  console.log(answer);

  offerObj.answer = answer;

  const offerIceCandidates = await socket.emitWithAck("newAnswer", offerObj);
  offerIceCandidates.forEach((c) => {
    peerConnection.addIceCandidate(c);
    console.log("======Added Ice Candidate======");
  });
  console.log(offerIceCandidates);
};

const addAnswer = async (offerObj) => {
  await peerConnection.setRemoteDescription(offerObj.answer);
};

document.querySelector("#call").addEventListener("click", call);
