export const isPromise = (p: any) => {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }

  return false;
};

// ✅ Check if return value is promise
export const returnsPromise = (f: any) => {
  if (f.constructor.name === 'AsyncFunction' || (typeof f === 'function' && isPromise(f()))) {
    return true;
  }

  return false;
};
