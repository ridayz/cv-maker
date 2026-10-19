// Tipe data CV — bentuk JSON kolom `cvs.data`
export type CVPersonal = {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  photo: string;
};

export type CVExperience = {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  desc: string;
};

export type CVEducation = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  desc: string;
};

export type CVSkill = {
  id: string;
  name: string;
};

export type CVCertificate = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type CVData = {
  personal: CVPersonal;
  summary: string;
  experiences: CVExperience[];
  education: CVEducation[];
  skills: CVSkill[];
  certificates: CVCertificate[];
  /** warna accent: lemon | lime | rose | sky | lav | mint */
  accent: string;
};
