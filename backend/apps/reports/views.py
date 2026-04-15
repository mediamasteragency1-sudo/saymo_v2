from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer
from apps.users.permissions import IsAdmin


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(reporter=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_reports_list(request):
    report_status = request.query_params.get('status', 'pending')
    reports = Report.objects.filter(
        status=report_status
    ).select_related('reporter', 'property', 'review')
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def admin_report_resolve(request, pk):
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response({'error': 'Signalement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['resolved', 'dismissed']:
        return Response({'error': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    report.status = new_status
    report.admin_note = request.data.get('admin_note', '')
    report.save()
    return Response(ReportSerializer(report).data)
