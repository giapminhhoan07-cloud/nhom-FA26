export function createQuestionOrder(length, random = Math.random) {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}

export function isValidQuestionOrder(order, length) {
  if (!Array.isArray(order) || order.length !== length) return false;
  const seen = new Set(order);
  return seen.size === length && order.every((index) => Number.isInteger(index) && index >= 0 && index < length);
}
