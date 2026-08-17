import ScheduleWizard from "@/components/ScheduleWizard";

/**
 * @page HomePage
 * @description Halaman utama aplikasi Edufio — menampilkan ScheduleWizard secara penuh.
 * Wizard bersifat Client Component sehingga halaman ini tetap Server Component.
 */
export default function HomePage() {
  return <ScheduleWizard />;
}
