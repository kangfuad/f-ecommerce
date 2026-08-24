import { BaseException } from './BaseException'

export class NotFoundException extends BaseException {
  constructor(resource: string, id?: string | number) {
    const detail = id ? ` dengan ID "${id}"` : ''
    super(`${resource}${detail} tidak ditemukan.`, 'RESOURCE_NOT_FOUND')
  }
}
