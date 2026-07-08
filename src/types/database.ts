export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_plate: string | null;
  created_at: string;
}

export interface Route {
  id: string;
  driver_id: string;
  name: string;
  origin: string | null;
  destination: string | null;
  default_fare: number | null;
  created_at: string;
}

export interface Passenger {
  id: string;
  driver_id: string;
  name: string;
  phone: string | null;
  route_id: string | null;
  weekly_rate: number | null;
  active: boolean;
  notes: string | null;
  created_at: string;
}

export type PaymentMethod = "efectivo" | "yape" | "plin" | "otro";

export interface IncomeRecord {
  id: string;
  driver_id: string;
  passenger_id: string | null;
  route_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  occurred_at: string;
  notes: string | null;
  created_at: string;
}

export type WeeklyPaymentStatus = "pendiente" | "pagado" | "parcial";

export interface WeeklyPayment {
  id: string;
  driver_id: string;
  passenger_id: string;
  week_start: string;
  week_end: string;
  amount_due: number;
  amount_paid: number;
  status: WeeklyPaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export type ExpenseCategory =
  | "combustible"
  | "mantenimiento"
  | "seguro"
  | "multa"
  | "otro";

export interface Expense {
  id: string;
  driver_id: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  occurred_at: string;
  created_at: string;
}
