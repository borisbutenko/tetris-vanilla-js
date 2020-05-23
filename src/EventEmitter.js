class EventEmitter {
    static events = Object.create(null)

    static on (name, callback) {
        EventEmitter.events[name] = callback
    }

    static emit (name, ...rest) {
        EventEmitter.events[name](...rest)
    }
}

export default EventEmitter
