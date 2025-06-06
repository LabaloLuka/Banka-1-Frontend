import React, { useState, useEffect } from "react";
import Sidebar from "../../components/mainComponents/Sidebar";
import DataTable from "../../components/tables/DataTable";
import AccountTransactionsList from "../../components/lists/AccountTransactionLists";
import {
    fetchAccounts,
    fetchAccountsForUser
} from "../../services/AxiosBanking";
import AccountButton from "../../components/common/AccountButton";
import { jwtDecode } from "jwt-decode";
import { fetchCustomerById } from "../../services/AxiosUser";

const AccountsPortal = () => {
    const [rows, setRows] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState([]);

    const columns = [
        // { field: "id", headerName: "ID", width: 70 }, // ID uklonjen
        { field: "owner", headerName: "Owner", width: 150 },
        { field: "accountNumber", headerName: "Account Number", width: 200 },
        { field: "balance", headerName: "Balance", width: 100 },
        // { field: "reservedBalance", headerName: "Reserved Balance", width: 100 },
        { field: "currencyType", headerName: "Currency", width: 100 },
        { field: "type", headerName: "Type", width: 200 },
        // { field: "subtype", headerName: "Subtype", width: 120 },
        // { field: "createdDate", headerName: "Created Date", width: 150 },
        // { field: "expirationDate", headerName: "Expiration Date", width: 150 },
        { field: "dailyLimit", headerName: "Daily Limit", width: 100 },
        { field: "monthlyLimit", headerName: "Monthly Limit", width: 120 },
        // { field: "dailySpent", headerName: "Daily Spent", width: 100 }150,
        // { field: "monthlySpent", headerName: "Monthly Spent", width: 100 },
        { field: "status", headerName: "Status", width: 120 },
        // { field: "employeeID", headerName: "Employee ID", width: 100 },
        // { field: "monthlyMaintenanceFee", headerName: "Maintenance Fee", width: 100 },
        {
            field: "company",
            headerName: "Company",
            flex: 1,
            valueGetter: (params) => params.row?.company?.name ?? "N/A"
        },
        {
            field: "actions",
            headerName: "Details",
            width: 180,
            renderCell: (params) => <AccountButton account={params.row} />,
        }
    ];

    /*Meni je receno da fetch accounts treba da uzima sve akaunte pa onda da iz jwta uzimam id i filtriram  */
    /* mozda treba da se gadja ova putanja samo api.get(`/accounts/user/${userId}`) */
    /* Proveriti */

    //Hook za ucitavanje svih racuna i njihovo filtriranje
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const filteredAccounts = await fetchAccountsForUser();
                console.log("filtered accounts = ", filteredAccounts);
                let ownerName = "";
                if (Array.isArray(filteredAccounts) && filteredAccounts.length > 0) {
                    const respones = await fetchCustomerById(filteredAccounts[0].ownerID);
                    ownerName = respones.data.firstName + " " + respones.data.lastName;
                    console.log(ownerName);
                    setSelectedAccountId(filteredAccounts[0].id);
                }

                // const ownerName = "neko";
                // const accountOwner = await  fetchCustomerById(filteredAccounts.ownerID);
                // console.log(accountOwner)
                console.log(filteredAccounts);
                //const response = await fetchAccounts();
                //const filteredAccounts = response.filter(row => row.ownerID === userId);

                const formattedRows = filteredAccounts.map(row => ({
                    id: row.id,
                    ownerID: row.ownerID,
                    owner: ownerName,
                    accountNumber: row.accountNumber,
                    balance: row.balance,
                    reservedBalance: row.reservedBalance,
                    type: row.type?.replace("FOREIGN_CURRENCY", "FOREIGN CURRENCY"),
                    currencyType: row.currencyType,
                    subtype: row.subtype,
                    createdDate: new Date(row.createdDate).toLocaleDateString(),
                    expirationDate: new Date(row.expirationDate).toLocaleDateString(),
                    dailyLimit: row.dailyLimit,
                    monthlyLimit: row.monthlyLimit,
                    dailySpent: row.dailySpent,
                    monthlySpent: row.monthlySpent,
                    status: row.status,
                    employeeID: row.employeeID,
                    monthlyMaintenanceFee: row.monthlyMaintenanceFee,
                    company: row.company ? row.company.name : "N/A"
                }));

                const filteredAccountsThatAreActive = formattedRows
                    .filter(row => row.status !== 'CLOSED')
                    .sort((a, b) => b.balance - a.balance);

                setRows(filteredAccountsThatAreActive);
            } catch (err) {
                console.error(err);
                setError("Failed to load customers data");
            } finally {
                setLoading(false);
            }
        };

        loadAccounts();
    }, [userId]);

    /*Extracting user id */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id);
                console.log(decodedToken.id);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token");
            }
        }
    }, []);

    //Kad kliknemo na red postavljamo selektovani racun na id reda na koji smo kliknuli
    const handleAccountClick = (row) => {
        setSelectedAccountId(row.id);
    };
    
    console.log("selectedAccountID", selectedAccountId)
    return (
        <div className="flex">
            <Sidebar />
            <div style={{ padding: '20px', marginTop: '64px' }}>
                <h2>Accounts Management</h2>
                {loading ? (
                    <p>Loading accounts data...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    // Display the accounts data in a table
                    <DataTable
                        rows={rows}
                        columns={columns}
                        checkboxSelection={false}
                        onRowClick={handleAccountClick}
                    />
                )}

                {/*<DataTable
                    rows={rows}
                    columns={columns}
                    checkboxSelection={false}
                    onRowClick={handleAccountClick}
                />*/}

                {/*{selectedAccountId && (*/}
                <div style={{ marginTop: "20px" }}>
                    <h3>Transactions for account {selectedAccountId}</h3>
                    <AccountTransactionsList accountId={selectedAccountId} />
                </div>
                {/*)}*/}
            </div>
        </div>
    );
};

export default AccountsPortal;