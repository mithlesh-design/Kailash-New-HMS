import { create } from 'zustand'

export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'out_of_service'
export type TripStatus = 'dispatched' | 'en_route' | 'at_scene' | 'transporting' | 'completed' | 'cancelled'
export type TripType = 'emergency' | 'transfer' | 'discharge' | 'scheduled'

export interface AmbulanceVehicle {
  id: string
  vehicleNumber: string
  type: 'Basic Life Support' | 'Advanced Life Support' | 'Neonatal' | 'Patient Transport'
  driverId: string
  driverName: string
  paramedicId?: string
  paramedicName?: string
  status: VehicleStatus
  lastServiceDate: string
  currentLocation?: string
  fuelLevel?: number
}

export interface AmbulanceTrip {
  id: string
  vehicleId: string
  vehicleNumber: string
  tripType: TripType
  patientName?: string
  patientId?: string
  pickupLocation: string
  destination: string
  dispatchedAt: string
  arrivedAt?: string
  completedAt?: string
  status: TripStatus
  callerName?: string
  callerPhone?: string
  chiefComplaint?: string
  responseTimeMinutes?: number
}

interface AmbulanceState {
  vehicles: AmbulanceVehicle[]
  trips: AmbulanceTrip[]
  dispatch: (vehicleId: string, trip: Omit<AmbulanceTrip, 'id' | 'vehicleId' | 'vehicleNumber' | 'dispatchedAt' | 'status'>) => void
  updateTrip: (id: string, update: Partial<AmbulanceTrip>) => void
  updateVehicle: (id: string, update: Partial<AmbulanceVehicle>) => void
  availableVehicles: () => AmbulanceVehicle[]
}

const VEHICLES: AmbulanceVehicle[] = [
  { id: 'AMB-01', vehicleNumber: 'MH-01-AA-1234', type: 'Advanced Life Support', driverId: 'DRV-01', driverName: 'Sunil Yadav', paramedicId: 'PARA-01', paramedicName: 'Ravi Sharma', status: 'available', lastServiceDate: '2026-04-15', currentLocation: 'Hospital Bay', fuelLevel: 90 },
  { id: 'AMB-02', vehicleNumber: 'MH-01-AA-5678', type: 'Basic Life Support', driverId: 'DRV-02', driverName: 'Mahesh Patil', status: 'on_trip', lastServiceDate: '2026-04-20', fuelLevel: 65 },
  { id: 'AMB-03', vehicleNumber: 'MH-01-AA-9012', type: 'Patient Transport', driverId: 'DRV-03', driverName: 'Ganesh Rao', status: 'available', lastServiceDate: '2026-05-01', currentLocation: 'Hospital Bay', fuelLevel: 80 },
  { id: 'AMB-04', vehicleNumber: 'MH-01-AA-3456', type: 'Neonatal', driverId: 'DRV-04', driverName: 'Ashok Kumar', status: 'maintenance', lastServiceDate: '2026-04-10' },
]

const TRIPS: AmbulanceTrip[] = [
  { id: 'TRIP-001', vehicleId: 'AMB-02', vehicleNumber: 'MH-01-AA-5678', tripType: 'emergency', pickupLocation: 'Andheri East, Mumbai', destination: 'Kailash Hospital', dispatchedAt: new Date(Date.now() - 1800000).toISOString(), status: 'transporting', callerName: 'Ramesh', callerPhone: '9876543210', chiefComplaint: 'Chest pain', responseTimeMinutes: 8 },
  { id: 'TRIP-002', vehicleId: 'AMB-01', vehicleNumber: 'MH-01-AA-1234', tripType: 'transfer', patientName: 'Kiran Patil', patientId: 'PT-20394', pickupLocation: 'Kailash Hospital', destination: 'AIIMS Delhi', dispatchedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 75600000).toISOString(), status: 'completed', responseTimeMinutes: 5 },
]

export const useAmbulanceStore = create<AmbulanceState>((set, get) => ({
  vehicles: VEHICLES,
  trips: TRIPS,
  dispatch: (vehicleId, trip) => {
    const vehicle = get().vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return
    const newTrip: AmbulanceTrip = { ...trip, id: `TRIP-${Date.now()}`, vehicleId, vehicleNumber: vehicle.vehicleNumber, dispatchedAt: new Date().toISOString(), status: 'dispatched' }
    set((state) => ({
      trips: [newTrip, ...state.trips],
      vehicles: state.vehicles.map((v) => v.id === vehicleId ? { ...v, status: 'on_trip' } : v),
    }))
  },
  updateTrip: (id, update) =>
    set((state) => ({ trips: state.trips.map((t) => t.id === id ? { ...t, ...update } : t) })),
  updateVehicle: (id, update) =>
    set((state) => ({ vehicles: state.vehicles.map((v) => v.id === id ? { ...v, ...update } : v) })),
  availableVehicles: () => get().vehicles.filter((v) => v.status === 'available'),
}))
