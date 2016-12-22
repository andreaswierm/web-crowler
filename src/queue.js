var concurrentLimit = 1,
    executingNumber = 0,
    queueList = [],
    cb;

/**
 * @name apply
 * @description Executes the queue list whithin the concurrent limit
 */
const apply = () => {
  executingNumber += 1;

  cb(queueList[0], () => {
    queueList.shift();

    executingNumber -= 1;

    for (var i = 0; i < (queueList.length > concurrentLimit ? concurrentLimit : queueList.length); i++) {
      if (executingNumber < concurrentLimit) {
        apply();
      }
    }
  });
}

/**
 * @name create
 * @description Sets up the queue process and start the first item
 */
const create = (initialValue, _concurrentLimit, _cb) => {
  queueList = initialValue;
  cb = _cb;
  executingNumber = 0;
  concurrentLimit = _concurrentLimit || 1;

  apply();
}

/**
 * @name push
 * @description Adds more items to the queue list
 */
const push = (items) => {
  queueList = queueList.concat(items);
}

module.exports = {
  apply: apply,
  create: create,
  push: push
};
