/**
 * Centralized Base Exception
 */
export abstract class BaseException extends Error {
  public readonly code: string
  public readonly timestamp: Date

  constructor(message: string, code = 'BASE_EXCEPTION') {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.timestamp = new Date()

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
    }
  }
}
