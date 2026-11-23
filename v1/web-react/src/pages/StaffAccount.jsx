import DataTable from '../components/DataTable'

const StaffAccount = () => {
  return (
    <div className="w-full p-6 bg-linear-to-r from-white to-purple-100">
      <DataTable title="Staff Accounts"
                fetchUrl="http://localhost:3000/admin-dashboard/users"
                columns={[
                  { header: "ID", accessor: "userId" },
                  { header: "User Name", accessor: "userName" },
                  { header: "Password", accessor: "password" },
                  { header: "Role", accessor: "role" },
                  { header: "Status", accessor: "status" }
                ]} />

      <DataTable
                title="Drivers Accounts"
                fetchUrl="http://localhost:3000/driver"
                columns={[
                  { header: "ID", accessor: "driverId" },
                  { header: "Driver Name", accessor: "driverName" },
                  { header: "License", accessor: "licenseNumber" },
                  { header: "Phone Number", accessor: "driverPhone" },
                ]}
              />
    </div>
  )
}

export default StaffAccount
