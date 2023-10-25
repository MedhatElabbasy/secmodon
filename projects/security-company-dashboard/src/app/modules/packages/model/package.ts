export interface Package {
  id: String,
  packageName: String,
  packageNameEn: String,
  packageDescription: String,
  packageDescriptionEn: String,
  packageTotalCost: Number,
  packageDetails: PackageDetails[]
}

export interface PackageDetails {
  id?: String,
  packageItemsId: String,
  limit: Number,
  isAvilable: Boolean,
  packageItems: packageItems
}
export interface packageItems {
  id?: String,
  isDeleted: Boolean,
  itemName: String,
  itemNameEn: String,
  value: Number,
  keysEnable: String,
  keysDisable: String,
  blockedService: String,
  cost: Number,
  isUndefined: Boolean,
  created: String,
  createdBy: String
}
