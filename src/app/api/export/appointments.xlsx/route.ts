export async function GET() {
  const content = 'Excel ficticio de citas médicas';
  return new Response(content, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="appointments.xlsx"',
    },
  });
}
