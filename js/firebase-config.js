/* ============================================================
   KONFIGURASI FIREBASE — supaya panel admin bisa dibuka
   dari HP MANAPUN (bukan cuma HP tempat dia menulis pesan).

   Cara dapat konfigurasi ini (gratis, ±10 menit):
   1. Buka https://console.firebase.google.com -> buat project baru
      (nama bebas, misal "kado-bintang-eka").
   2. Di menu kiri: Build -> Firestore Database -> Create database
      -> pilih "Start in test mode" -> pilih lokasi -> Enable.
   3. Di menu kiri: Project settings (ikon gerigi) -> scroll ke
      "Your apps" -> klik ikon </> (Web) -> kasih nama apa saja
      -> Register app.
   4. Akan muncul kode berisi object "firebaseConfig = {...}".
      Copy semua isinya, tempel menggantikan object kosong di
      bawah ini.
   5. (Opsional tapi disarankan) Di Firestore -> tab "Rules",
      pastikan ada tanggal kadaluarsa test mode, atau ganti jadi:
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /messages/{doc} {
              allow read, write: if true;
            }
          }
        }
      (rule ini simpel & terbuka, cukup untuk kado personal —
      jangan taruh data sensitif lain di project Firebase ini)

   Kalau object di bawah dibiarkan kosong seperti semula, website
   tetap jalan normal, hanya saja pesan cuma tersimpan lokal di
   HP tempat dia menulis (seperti sebelumnya).
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCrqxIAi9lJXfZi_hDn506HizNIl8IQQbY",
  authDomain: "gift-6e486.firebaseapp.com",
  projectId: "gift-6e486",
  storageBucket: "gift-6e486.firebasestorage.app",
  messagingSenderId: "148796512697",
  appId: "1:148796512697:web:d32c70787499bd50e93e68"
};

const FIREBASE_ENABLED = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);

let firestoreDb = null;
function getFirestore() {
  if (!FIREBASE_ENABLED) return null;
  if (firestoreDb) return firestoreDb;
  if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
  firestoreDb = window.firebase.firestore();
  return firestoreDb;
}
