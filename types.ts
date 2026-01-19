
export interface Package {
  id: string;
  name: string;
  duration: string;
  price: number;
  desc: string;
}

export interface Voucher {
  code: string;
  pid: string;
  used: boolean;
  date: string;
}

export interface WifiRequest {
  id: number;
  phone: string;
  pid: string;
  status: 'PENDING' | 'DONE';
  code?: string;
}

export interface RouterDevice {
  id: number;
  name: string;
  ip: string;
  mac: string;
  status: string;
  speed: string;
  clients: number;
}
