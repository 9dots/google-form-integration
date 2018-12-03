/**
 * chunkBatch
 * @module
 */

/**
 * initialize state for chunkBatch
 * @param {Object} firestore @link firestore
 * @returns {Object<batches, batch, currentCount>}
 */
const initState = firestore => {
  const initBatch = firestore.batch()
  return {
    batches: [initBatch],
    batch: initBatch,
    currentCount: 0,
    nextBatch: () => firestore.batch()
  }
}

/**
 * Wrapper around firestore batch so that it automatically handles batches
 * larger than 500 writes.
 * @example
 * // returns chunkBatch
 * const batch = chunkBatch(admin.firestore)
 * writes.reduce((acc, next) => acc.set(next), batch).commit()
 * @param {firestore} firestore firebase firestore object
 * @return {Object} chunkBatch object
 *  - batches
 *  - batch
 *  - currentCount
 *  - nextBatch
 *  - set
 *  - delete
 *  - update
 *  - commit
 */
module.exports = function chunkBatch (firestore) {
  return {
    ...initState(firestore),
    set (...args) {
      return set(increment(this))(...args)
    },
    delete (...args) {
      return batchDelete(increment(this))(...args)
    },
    update (...args) {
      return update(increment(this))(...args)
    },
    commit () {
      return Promise.all(this.batches.map(batch => batch.commit()))
    }
  }
}

const batchDelete = state => (...args) => ({
  ...state,
  batch: state.batch.delete(...args)
})
const update = state => (...args) => ({
  ...state,
  batch: state.batch.update(...args)
})
const set = state => (...args) => ({
  ...state,
  batch: state.batch.set(...args)
})

const increment = state => {
  const currentCount = state.currentCount + 1
  return state.currentCount + 1 > 499
    ? addBatch(state)
    : Object.assign({}, state, { currentCount })
}

const addBatch = state => {
  const batch = state.nextBatch()
  return Object.assign({}, state, {
    batches: state.batches.concat(batch),
    currentCount: 0,
    batch
  })
}
