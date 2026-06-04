// Helper QR untuk Namu VMS.
import QRCode from "qrcode";

/// Menghasilkan QR sebagai data URL (bisa langsung dipakai di <img src>).
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 240,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
