import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, Plus, X } from "lucide-react-native";

export interface CarePlanTask {
  id: string;
  title: string;
  frequency: string;
}

export interface CarePlanEditorViewProps {
  initialTasks?: CarePlanTask[];
  initialValidUntil?: string;
  onSavePlan: (data: { tasks: CarePlanTask[]; validUntil: string }) => void;
  onCancel: () => void;
}

export function CarePlanEditorView({
  initialTasks = [],
  initialValidUntil = "",
  onSavePlan,
  onCancel,
}: CarePlanEditorViewProps) {
  const [tasks, setTasks] = useState<CarePlanTask[]>(initialTasks);
  const [validUntil, setValidUntil] = useState(initialValidUntil);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskFrequency, setNewTaskFrequency] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        frequency: newTaskFrequency.trim() || "Setiap hari",
      },
    ]);
    setNewTaskTitle("");
    setNewTaskFrequency("");
    setShowAddForm(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onCancel}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Rencana perawatan
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" className="text-muted-foreground leading-relaxed">
          Opsional. Pasien melihatnya sebagai daftar tugas.
        </Text>

        {/* Section: Tugas */}
        <VStack space="xs" className="gap-2">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            TUGAS
          </Heading>

          <Box className="border border-border rounded-2xl bg-card overflow-hidden">
            {tasks.length === 0 ? (
              <Box className="p-4 items-center">
                <Text size="sm" className="text-muted-foreground">
                  Belum ada tugas rencana perawatan.
                </Text>
              </Box>
            ) : (
              tasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  {idx > 0 && <Box className="border-t border-dashed border-border" />}
                  <HStack className="items-center justify-between p-3.5 min-h-[60px]">
                    <VStack space="xs" className="flex-1 pr-2">
                      <Text size="sm" bold className="text-foreground">
                        {task.title}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {task.frequency}
                      </Text>
                    </VStack>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Hapus ${task.title}`}
                      onPress={() => handleDeleteTask(task.id)}
                      className="w-11 h-11 items-center justify-center"
                    >
                      <X size={18} color="#262130" />
                    </Pressable>
                  </HStack>
                </React.Fragment>
              ))
            )}
          </Box>

          {/* Add Task Input Form / Button */}
          {showAddForm ? (
            <VStack space="xs" className="border border-border rounded-2xl p-3.5 bg-card gap-2.5">
              <Input className="h-11 rounded-xl border border-border px-3 bg-background">
                <InputField
                  placeholder="Nama tugas (mis. Latihan grounding)"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  className="text-foreground text-sm"
                />
              </Input>
              <Input className="h-11 rounded-xl border border-border px-3 bg-background">
                <InputField
                  placeholder="Frekuensi (mis. 1x sehari)"
                  value={newTaskFrequency}
                  onChangeText={setNewTaskFrequency}
                  className="text-foreground text-sm"
                />
              </Input>
              <HStack space="xs" className="gap-2 pt-1">
                <Button
                  className="flex-1 h-11 bg-foreground rounded-xl"
                  onPress={handleAddTask}
                >
                  <ButtonText className="text-background font-semibold">
                    Simpan Tugas
                  </ButtonText>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-border rounded-xl px-4"
                  onPress={() => setShowAddForm(false)}
                >
                  <ButtonText className="text-foreground font-semibold">
                    Batal
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              variant="outline"
              className="h-[52px] border border-foreground rounded-xl"
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={18} color="#262130" />
              <ButtonText className="text-foreground font-semibold">
                + Tambah Tugas
              </ButtonText>
            </Button>
          )}
        </VStack>

        {/* Berlaku Sampai */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            Berlaku sampai
          </Text>
          <Input className="h-[52px] rounded-xl border border-border bg-card px-4">
            <InputField
              placeholder="Contoh: 2026-12-15 atau 30 hari ke depan"
              value={validUntil}
              onChangeText={setValidUntil}
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSavePlan({ tasks, validUntil })}
        >
          <ButtonText className="text-background font-semibold">
            Simpan Rencana
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onCancel}
        >
          <ButtonText className="text-foreground font-semibold">
            Batal
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
