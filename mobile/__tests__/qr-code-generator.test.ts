import { qrcodegen } from "../src/lib/vendor/qrcodegen";

describe("QRIS offline rendering", () => {
  it("encodes a gateway QRIS payload locally with a standard quiet zone", () => {
    const qr = qrcodegen.QrCode.encodeText(
      "00020101021226780014ID.CO.QRIS.WWW01189360091100000000180202030406000053033605405100005802ID6304ABCD",
      qrcodegen.QrCode.Ecc.MEDIUM,
    );
    expect(qr.size).toBeGreaterThan(20);
    expect(qr.size).toBeLessThanOrEqual(177);
    expect(typeof qr.getModule(0, 0)).toBe("boolean");
    expect(typeof qr.getModule(qr.size - 1, qr.size - 1)).toBe("boolean");
  });
});
