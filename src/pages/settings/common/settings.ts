export interface ISoftware {
  name?: string;
  id?: string;
  softwareCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
}

export interface IComplaintType {
  name?: string;
  id?: string;
  complaintTypeCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
}

export interface IComplaintCategory {
  name?: string;
  id?: string;
  complaintCategoryCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
}

export interface ICallStatus {
  name?: string;
  id?: string;
  callStatusCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
  isFinal?: boolean;
}

export interface ISetupStatus {
  name?: string;
  id?: string;
  setupStatusCode?: string;
  description?: string;
  colorCode?: string;
  isActive?: boolean;
}

export interface ISubscriptionType {
  name?: string;
  id?: string;
  subscriptionTypeCode?: string;
  description?: string;
  isActive?: boolean;
  durationInMonths?: number;
  colorCode?: string;
}

export interface ILeadStatus {
  name?: string;
  id?: string;
  leadStatusCode?: string;
  colorCode?: string;
  description?: string;
  isActive?: boolean;
}

export interface ILeadNextStep {
  name?: string;
  id?: string;
  leadNextStepCode?: string;
  description?: string;
  isActive?: boolean;
  colorCode?: string;
}
