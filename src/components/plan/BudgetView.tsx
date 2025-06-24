import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, TrendingUp, Package, Wrench, FileText, ShieldAlert, Plus } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { MaterialModal } from '@/components/shared/modals/MaterialModal';
import { Material } from '@/components/shared/modals';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/plan-helpers';
import { useMaterialModal } from '@/stores/modalStore';
import { BudgetViewProps } from '@/types/plan/views';
import {
  EditMaterialAction, 
  DeleteMaterialAction,
  HeaderActionBar
} from '@/components/shared/actions';

// Mock budget items as materials with cost focus
const mockBudgetMaterials: Material[] = [
  { id: '1', name: 'Foundation Concrete', description: 'Concrete for foundation work', quantity: 1, unit: 'lot', cost: 15000, vendor: 'Concrete Supply Co', category: 'Materials', phaseId: 'phase-1' },
  { id: '2', name: 'Framing Labor', description: 'Labor for framing work', quantity: 1, unit: 'lot', cost: 25000, vendor: 'Construction Crew', category: 'Labor', phaseId: 'phase-2' },
  { id: '3', name: 'Building Permit', description: 'Permit fees and documentation', quantity: 1, unit: 'permit', cost: 2500, vendor: 'City Planning Office', category: 'Permits', phaseId: 'phase-1' },
  { id: '4', name: 'Excavator Rental', description: 'Equipment rental for excavation', quantity: 1, unit: 'days', cost: 3000, vendor: 'Equipment Rental Co', category: 'Equipment', phaseId: 'phase-1' },
];


export function BudgetView({ plan }: BudgetViewProps) {
  const budget = plan.budget;
  const [budgetMaterials, setBudgetMaterials] = useState<Material[]>(mockBudgetMaterials);
  
  // Use shared MaterialModal for budget items
  const materialModal = useMaterialModal();

  // Calculate totals from budgetMaterials
  const calculatedTotals = React.useMemo(() => {
    const laborCost = budgetMaterials.filter(m => m.category === 'Labor').reduce((sum, m) => sum + (m.cost || 0), 0);
    const materialsCost = budgetMaterials.filter(m => m.category === 'Materials').reduce((sum, m) => sum + (m.cost || 0), 0);
    const equipmentCost = budgetMaterials.filter(m => m.category === 'Equipment').reduce((sum, m) => sum + (m.cost || 0), 0);
    const permitsCost = budgetMaterials.filter(m => m.category === 'Permits').reduce((sum, m) => sum + (m.cost || 0), 0);
    const total = laborCost + materialsCost + equipmentCost + permitsCost + budget.contingency;
    
    return {
      total,
      laborCost,
      materialsCost,
      equipmentCost,
      permitsCost,
      laborPercentage: total > 0 ? (laborCost / total) * 100 : 0,
      materialsPercentage: total > 0 ? (materialsCost / total) * 100 : 0,
      equipmentPercentage: total > 0 ? (equipmentCost / total) * 100 : 0,
      permitsPercentage: total > 0 ? (permitsCost / total) * 100 : 0,
      contingencyPercentage: total > 0 ? (budget.contingency / total) * 100 : 0
    };
  }, [budgetMaterials, budget.contingency]);

  // Using shared formatCurrency utility

  function handleAddBudgetItem() {
    materialModal.actions.open(undefined, 'budget', true);
  }

  function handleEditBudgetItem(materialId: string) {
    const material = budgetMaterials.find(m => m.id === materialId);
    if (material) {
      materialModal.actions.open(material, 'budget', false);
    }
  }

  function handleDeleteBudgetItem(materialId: string) {
    setBudgetMaterials(prev => prev.filter(m => m.id !== materialId));
  }

  function handleSaveBudgetMaterial(savedMaterial: Material) {
    setBudgetMaterials(prevMaterials => {
      if (materialModal.isNew) {
        const newMaterial = { ...savedMaterial, id: Date.now().toString() };
        return [...prevMaterials, newMaterial];
      } else {
        return prevMaterials.map(material => 
          material.id === savedMaterial.id ? { ...material, ...savedMaterial } : material
        );
      }
    });
    materialModal.actions.close();
  }

  const BudgetItemSummary = ({ 
    icon, 
    title, 
    amount, 
    percentage, 
    color 
  }: { 
    icon: React.ReactNode, 
    title: string, 
    amount: number, 
    percentage: number, 
    color: string 
  }) => (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center p-5 border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 rounded-xl bg-gradient-to-r from-white/90 to-buildease-blue-50/60 dark:from-gray-800/90 dark:to-buildease-blue-950/30 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm ring-1 ring-buildease-blue-100/20 dark:ring-buildease-blue-900/20 hover:ring-buildease-blue-200/30 dark:hover:ring-buildease-blue-800/30"
    >
      <div className={`p-3 rounded-lg mr-4 ${color} shadow-sm ring-1 ring-white/20 dark:ring-gray-900/20`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">{title}</h3>
        <p className="text-xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200">
          {formatCurrency(amount)}
        </p>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-buildease-blue-600/80 dark:text-buildease-blue-400/80">{percentage.toFixed(1)}%</span>
        <div className="w-16 h-2 bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 rounded-full mt-1 shadow-inner">
          <div 
            className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('/10', '')}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </m.div>
  );

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-buildease-blue-50/50 via-white/80 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/40 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 pb-4 flex flex-row items-center justify-between backdrop-blur-sm">
            <HeaderActionBar
              title="Budget Summary"
              onAdd={handleAddBudgetItem}
              addButtonText="Add Budget Item"
              addButtonIcon={Plus}
            />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <p className="text-lg font-medium text-buildease-blue-600/80 dark:text-buildease-blue-400/80">Total Budget</p>
              <h2 className="text-4xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200 tracking-tight mt-2">
                {formatCurrency(calculatedTotals.total)}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BudgetItemSummary 
                icon={<Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />} 
                title="Labor" 
                amount={calculatedTotals.laborCost} 
                percentage={calculatedTotals.laborPercentage} 
                color="text-blue-600/10 dark:text-blue-400/10"
              />
              <BudgetItemSummary 
                icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />} 
                title="Materials" 
                amount={calculatedTotals.materialsCost} 
                percentage={calculatedTotals.materialsPercentage} 
                color="text-green-600/10 dark:text-green-400/10"
              />
              <BudgetItemSummary 
                icon={<Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />} 
                title="Equipment" 
                amount={calculatedTotals.equipmentCost} 
                percentage={calculatedTotals.equipmentPercentage} 
                color="text-amber-600/10 dark:text-amber-400/10"
              />
              <BudgetItemSummary 
                icon={<FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />} 
                title="Permits & Fees" 
                amount={calculatedTotals.permitsCost} 
                percentage={calculatedTotals.permitsPercentage} 
                color="text-purple-600/10 dark:text-purple-400/10"
              />
              <div className="md:col-span-2">
                <BudgetItemSummary 
                  icon={<ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />} 
                  title="Contingency" 
                  amount={budget.contingency} 
                  percentage={calculatedTotals.contingencyPercentage} 
                  color="text-orange-600/10 dark:text-orange-400/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-buildease-blue-50/50 via-white/80 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/40 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 backdrop-blur-sm">
            <CardTitle className="text-xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center tracking-tight">
              <TrendingUp className="h-5 w-5 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
              Budget Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No budget items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.description}</TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.quantity} {material.unit}</TableCell>
                      <TableCell className="text-right font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">
                        {formatCurrency(material.cost || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditMaterialAction
                            onEditMaterial={handleEditBudgetItem}
                            phaseId={material.phaseId || 'budget'}
                            materialId={material.id}
                          />
                          <DeleteMaterialAction
                            onDeleteMaterial={handleDeleteBudgetItem}
                            phaseId={material.phaseId || 'budget'}
                            materialId={material.id}
                            materialName={material.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </m.div>

      <MaterialModal
        show={materialModal.isOpen}
        onClose={materialModal.actions.close}
        onSave={handleSaveBudgetMaterial}
        material={materialModal.data}
        isNew={materialModal.isNew}
        phaseId="budget"
      />
    </div>
  );
}
