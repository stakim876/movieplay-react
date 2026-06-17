import { storage } from "@/services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProfileImage(file, userId) {
  if (!file) throw new Error("파일이 없습니다.");
  if (!userId) throw new Error("사용자 ID가 없습니다.");
  if (!storage) throw new Error("Firebase Storage가 초기화되지 않았습니다. .env 설정을 확인해주세요.");

  const fileRef = ref(storage, `profiles/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);

  return await getDownloadURL(fileRef);
}
