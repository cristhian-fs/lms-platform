import { NotFoundError } from "../errors";
import * as moduleRepo from "../repositories/module";

export { NotFoundError };

export async function create(courseId: string, data: { title: string; order: number }) {
  const [mod] = await moduleRepo.create({ courseId, ...data });
  return mod;
}

export async function update(id: string, data: { title?: string; order?: number }) {
  const [mod] = await moduleRepo.update(id, data);
  if (!mod) throw new NotFoundError();
  return mod;
}

export async function remove(id: string) {
  const [mod] = await moduleRepo.remove(id);
  if (!mod) throw new NotFoundError();
  return mod;
}
