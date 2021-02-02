export interface CRUDRepository<ID, T> {
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | undefined>;
  // add(t: Partial<T>): Promise<void>;
  update(t: T): Promise<void>;
}
