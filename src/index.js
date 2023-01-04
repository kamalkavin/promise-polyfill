function PromisePolyfill(executor) {
  let onResolve,
    onReject,
    isFulfilled = false,
    isRejected = false,
    isCalled = false,
    value;

  function resolve(val) {
    isFulfilled = true;
    value = val;
    if (typeof onResolve === "function") {
      onResolve(val);
      isCalled = true;
    }
  }
  function reject(val) {
    isRejected = true;
    value = val;
    if (typeof onReject === "function") {
      onReject(val);
      isCalled = true;
    }
  }
  this.then = function (cb) {
    onResolve = cb;
    if (isFulfilled && !isCalled) {
      isCalled = true;
      onResolve(value);
    }
    return this;
  };
  this.catch = function (cb) {
    onReject = cb;
    if (isRejected && !isCalled) {
      isCalled = true;
      onReject(value);
    }
    return this;
  };
  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

PromisePolyfill.resolve = (val) => {
  return new PromisePolyfill(function executor(resolve, reject) {
    resolve(val);
  });
};

PromisePolyfill.reject = (val) => {
  return new PromisePolyfill(function executor(resolve, reject) {
    reject(val);
  });
};

PromisePolyfill.all = (promises) => {
  let fulfilledPromises = [],
    result = [];

  function executor(resolve, reject) {
    promises.forEach((promise, index) =>
      promise
        .then((val) => {
          fulfilledPromises.push(true);
          result[index] = val;

          if (fulfilledPromises.length === promises.length) {
            return resolve(result);
          }
        })
        .catch((error) => {
          return reject(error);
        })
    );
  }
  return new PromisePolyfill(executor);
};

Promise.allPollyfill = (promises) => {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!promises.length) {
      resolve(results);
      return;
    }

    let pendingPromises = promises.length;
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then((res) => {
        results[index] = res;
        pendingPromises--;

        if (pendingPromises === 0) {
          resolve(results);
        }
      }, reject);
    });
  });
};

function promise1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve("promise 1");
    }, 1000);
  });
}

function promise2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve("promise 2");
    }, 1000);
  });
}

// promise2
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => console.log(err));

Promise.allPollyfill([promise1(), promise2()])
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.log("Failed:", err));
