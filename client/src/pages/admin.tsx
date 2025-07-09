import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
    };
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const formData = new FormData(e.currentTarget);
    const userData = {
      id: editingUser.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      isActive: formData.get('isActive') === 'true',
    };
    updateUserMutation.mutate(userData);
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const activeUsers = users?.filter(u => u.isActive).length || 0;
  const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
  const healthWorkers = users?.filter(u => u.role === 'health_worker').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage health workers and administrators
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="health_worker">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_worker">Health Worker</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users?.length || 0}</p>
              </div>
              <div className="bg-medical-blue bg-opacity-10 p-3 rounded-full">
                <Users className="text-medical-blue h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-success-green">{activeUsers}</p>
              </div>
              <div className="bg-success-green bg-opacity-10 p-3 rounded-full">
                <Activity className="text-success-green h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-semibold text-error-red">{adminUsers}</p>
              </div>
              <div className="bg-error-red bg-opacity-10 p-3 rounded-full">
                <ShieldCheck className="text-error-red h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-900">User</th>
                    <th className="text-left p-3 font-medium text-gray-900">Contact</th>
                    <th className="text-left p-3 font-medium text-gray-900">Role</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-gray-500 text-xs">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {user.email && <div>{user.email}</div>}
                          {user.phone && <div className="text-gray-500">{user.phone}</div>}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="mr-1 h-3 w-3" />
                              Administrator
                            </>
                          ) : (
                            <>
                              <Users className="mr-1 h-3 w-3" />
                              Health Worker
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${getStatusColor(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-medical-blue hover:bg-blue-50"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.id !== user.id && ( // Don't allow deleting self
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-error-red hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingUser.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={editingUser.phone || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editingUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_worker">Health Worker</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="isActive" defaultValue={editingUser.isActive?.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
