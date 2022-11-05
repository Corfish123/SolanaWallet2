export const truncateAddress = (address) => {
  if (!address) return "No Account";
  return address.slice(0, 4) + ".." + address.slice(-4);
};
