import { Model } from 'mongoose';


interface PaginateOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const paginate = async <T>(
  model: Model<T>,
  query: any,
  options: PaginateOptions = {},
  populateFields?: string | string[]
): Promise<PaginatedResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(query)
      .populate(populateFields as string || '')
      .skip(skip)
      .limit(limit)
      .lean() as unknown as T[],
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
