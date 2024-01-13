export class RefreshTokenPayloadEntity {
  constructor(
    public sub: string,
    public email: string,
  ) {}
}
