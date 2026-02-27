from .models import LedgerEntry


def create_ledger_entry(
    *,
    module,
    reference_id,
    action,
    changed_by=None,
    old_data=None,
    new_data=None,
    note=None,
):
    LedgerEntry.objects.create(
        module=module,
        reference_id=reference_id,
        action=action,
        changed_by=changed_by,
        old_data=old_data,
        new_data=new_data,
        note=note,
    )
