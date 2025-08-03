localVideoEl = document.querySelector("#local-video");

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoEl.srcObject = stream;
      resolve();
    } catch (err) {
      console.log(err);
      reject();
    }
  });
};

document.querySelector("#call").addEventListener("click", fetchUserMedia);
