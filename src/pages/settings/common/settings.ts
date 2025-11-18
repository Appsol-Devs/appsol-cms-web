export interface ISoftware {
  name?: string;
  _id: string;
  softwareCode?: string;
  description?: string;
  isActive?: boolean;
}

export interface IComplaintType {
  name?: string;
  _id?: string;
  complaintTypeCode?: string;
  description?: string;
  isActive?: boolean;
}

export interface IComplaintCategory {
  name?: string;
  _id?: string;
  complaintCategoryCode?: string;
  description?: string;
  isActive?: boolean;
}

export interface ICallStatus {
  name?: string;
  _id?: string;
  callStatusCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
  isFinal?: boolean;
}

export interface ISetupStatus {
  name?: string;
  _id?: string;
  setupStatusCode?: string;
  description?: string;
  colorCode?: string;
  isActive?: boolean;
}

export interface ISubscriptionType {
  name?: string;
  _id?: string;
  subscriptionTypeCode?: string;
  description?: string;
  isActive?: boolean;
  durationInMonths?: number;
}

export interface ILeadStatus {
  name?: string;
  _id?: string;
  leadStatusCode?: string;
  colorCode?: string;
  description?: string;
  isActive?: boolean;
}

export interface ILeadNextStep {
  name?: string;
  _id?: string;
  leadNextStepCode?: string;
  description?: string;
  isActive?: boolean;
}
