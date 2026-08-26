import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class ProviderStoreGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Akses ditolak: Pengguna tidak terotentikasi.');
    }

    if (!user.hasProviderStore) {
      throw new ForbiddenException('Akses ditolak: Akun Anda belum terdaftar sebagai Mitra Penyedia Sewa.');
    }

    return true;
  }
}
