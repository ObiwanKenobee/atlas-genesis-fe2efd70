import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllTransactions } from "@/hooks/useAdmin";
import { PROJECT_TYPE_ICONS } from "@/types/marketplace";

const TransactionsTable = () => {
  const { data: transactions, isLoading } = useAllTransactions();

  const statusColors: Record<string, string> = {
    completed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    refunded: "bg-muted text-muted-foreground border-muted",
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h2 className="font-display text-xl font-semibold text-foreground">Recent Transactions</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">
                      {transaction.id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {PROJECT_TYPE_ICONS[transaction.carbon_projects?.project_type as keyof typeof PROJECT_TYPE_ICONS] || '🌍'}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                        {transaction.carbon_projects?.title || 'Unknown Project'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{transaction.quantity}</span>
                    <span className="text-muted-foreground text-sm ml-1">credits</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">
                      ${Number(transaction.total_amount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[transaction.status]}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground capitalize">
                      {transaction.payment_method || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default TransactionsTable;
