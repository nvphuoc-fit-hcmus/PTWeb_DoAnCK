/**
 * Pagination helper utility
 * Adds pagination to Knex queries
 */

const paginate = async (query, page = 1, limit = 10) => {
  // Ensure page and limit are numbers
  const currentPage = parseInt(page) || 1;
  const pageLimit = parseInt(limit) || 10;
  
  // Calculate offset
  const offset = (currentPage - 1) * pageLimit;
  
  // Clone query for count
  const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
  const [{ total }] = await countQuery;
  
  // Get paginated data
  const data = await query.limit(pageLimit).offset(offset);
  
  // Calculate total pages
  const totalPages = Math.ceil(total / pageLimit);
  
  return {
    data,
    pagination: {
      page: currentPage,
      limit: pageLimit,
      total: parseInt(total),
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
};

module.exports = { paginate };
