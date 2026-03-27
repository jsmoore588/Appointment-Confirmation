import { notFound } from "next/navigation";
import { AppointmentPage } from "@/components/appointment-page";
import { getAppointmentById } from "@/lib/storage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AppointmentRoute({ params }: Props) {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  return <AppointmentPage appointment={appointment} />;
}
