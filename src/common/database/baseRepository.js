class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findOne(filter = {}, projection = null) {
    return this.model.findOne({ ...filter, deletedAt: null }, projection);
  }

  async findById(id) {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt", projection = null } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { ...filter, deletedAt: null };

    const [items, total] = await Promise.all([
      this.model.find(query, projection).sort(sort).skip(skip).limit(Number(limit)),
      this.model.countDocuments(query)
    ]);

    return {
      items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }

  async updateById(id, payload) {
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });
  }

  async softDeleteById(id) {
    return this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }
}

module.exports = BaseRepository;
