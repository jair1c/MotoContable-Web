export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_plate: string | null;
  created_at: string;
}

export interface Passenger {
  id: string;
  driver_id: string;
  name: string;
  phone: string | null;
  fare_ida: number;
  fare_vuelta: number;
  days_of_week: number[];
  active: boolean;
  notes: string | null;
  created_at: string;
}

export type Leg = "ida" | "vuelta";

export interface TripLeg {
  id: string;
  driver_id: string;
  passenger_id: string;
  leg_date: string;
  leg: Leg;
  amount: number;
  weekly_payment_id: string | null;
  created_at: string;
}

export type PaymentMethod = "efectivo" | "yape" | "plin" | "otro";

export interface Extra {
  id: string;
  driver_id: string;
  amount: number;
  payment_method: PaymentMethod;
  note: string | null;
  occurred_at: string;
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
