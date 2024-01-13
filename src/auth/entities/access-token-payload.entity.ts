export class AccessTokenPayloadEntity {
  constructor(
    public sub: string,
    public email: string,
  ) {}
}
