let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function emit(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

export function getIO() {
  return ioInstance;
}

