import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-accent" />;
    case "alert":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationBg = (type: Notification["type"], read: boolean) => {
  if (read) return "bg-transparent";
  switch (type) {
    case "success":
      return "bg-primary/5";
    case "warning":
      return "bg-accent/5";
    case "alert":
      return "bg-destructive/5";
    default:
      return "bg-muted/30";
  }
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-accent/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 bg-card border-border shadow-elevated"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 transition-colors ${getNotificationBg(
                      notification.type,
                      notification.read
                    )}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded hover:bg-muted/50 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
