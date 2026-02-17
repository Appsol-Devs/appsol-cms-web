
export interface ICustomerOutreach {
  customerId: string
  customer: Customer
  purpose: string
  notes: string
  callStatus: CallStatus
  outreachType: OutreachType
  outreachTypeId: string
  callStatusId: string
  isRoutineCall: boolean
  loggedBy: LoggedBy
  status: string
  _id: string
  createdAt: string
  updatedAt: string
  outreachCode?: string
}

export interface Customer {
  _id: string
  name: string
  email: string
  phone: string
}

export interface CallStatus {
  _id: string
  name: string
  colorCode?: string
}

export interface OutreachType {
  _id: string
  name: string
  colorCode: string
}

export interface LoggedBy {
  _id: string
  firstName: string
  lastName: string
  email: string
}