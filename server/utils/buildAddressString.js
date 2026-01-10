const buildAddressString = (address) => {
  if (!address) return "";

  return [
    address.houseNo,
    address.street,
    address.wardNo && `Ward ${address.wardNo}`,
    address.municipality,
    address.district,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};
export default buildAddressString;